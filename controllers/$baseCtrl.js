const { isUndefined } = require("util");
const multer = require("multer");
const APIResponse = require("./APIResponse");
// const LocalStorage = require("../services/localStorage");

// [TODO] mime types checking
// [TODO] general uploaded files response [LocalStorage, ColudniaryStorage, S3Storage, ...]
// [TODO] rollback uploads in failures [incompleted files uploading]

module.exports = function (a, b, c) {
  let files = null;
  let storage = null;
  let ctrl = null;

  if (arguments.length === 1) {
    ctrl = a;
  } else if (arguments.length === 2) {
    files = a;
    ctrl = b;
  } else if (arguments.length === 3) {
    files = a;
    storage = b;
    ctrl = c;
  }

  return (req, res, next) => {
    req.on("close", function () {});

    files = files || [];
    storage = storage;
    let uploader = multer({ storage: storage }).fields(files);
    return uploader(req, res, (err) => {
      // handle uploading errors (if any)
      if (err) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return APIResponse.BadRequest(res, "Unexpected file(s)");
        }
        console.log("here");
        return APIResponse.ServerError(res, err);
      }

      // [TOOD]: use qs for advanced fetch (filter, sorting)
      req.queryFilter = {};
      req.queryOptions = {};

      // filter (by any field)
      for (let field in req.query) {
        const ignoreList = ["sort", "paginate", "page", "limit"];
        if (ignoreList.indexOf(field) !== -1) continue;
        if (field === "id") {
          const id = parseInt(req.query.id);
          if (!isNaN(id)) req.queryFilter["_id"] = id;
        } else {
          req.queryFilter[field] = req.query[field];
        }
      }

      // sorting
      let sort = null;
      if (req.query.sort) {
        sort = req.query.sort;
        if (sort === "-id") sort = "-_id";
        else if (sort === "id") sort = "_id";
      }
      req.queryOptions = { ...req.queryOptions, sort: sort };

      // pagination query
      req.allowPagination = false;
      if (req.query.paginate !== "false") {
        req.allowPagination = true;
        req.queryOptions = {
          ...req.queryOptions,
          limit: parseInt(req.query.limit) || 10,
          page: parseInt(req.query.page) || 1,
        };
      }

      // toJSON method
      res.toJSON = (response, options) => {
        if (req.allowPagination && response.docs)
          response.docs = response.docs.map((doc) => doc.toJSON(options));
        else if (response instanceof Array)
          response = response.map((doc) => doc.toJSON(options));
        else response = response.toJSON(options);

        return response;
      };

      // ignore these fields from request
      delete req.body.id;
      delete req.body._id;
      delete req.body.__v;
      delete req.body.deleted;
      delete req.body.createdAt;
      delete req.body.updatedAt;

      // return Promise.resolve(ctrl(req, res)).catch(next);
      // handle validation errors
      return ctrl(req, res, next).catch((err) => {
        let validationErrors = [];
        let errors = err.errors;
        if (isUndefined(errors)) {
          return next(err);
        }
        for (let key in errors) {
          let value = errors[key];
          validationErrors.push({
            field: key,
            message: value.message,
          });
        }
        return APIResponse.UnprocessableEntity(res, validationErrors);
      });
    });
  };
};
