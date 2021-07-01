module.exports = {
  // Custom response
  CustomResponse: (res, status, messsage) => {},

  // 200 Ok
  Ok: (res, data = {}) => {
    return res.status(200).json(data);
  },

  // 201 Ok
  Created: (res, data = {}) => {
    return res.status(201).json(data);
  },

  // 204 No Content
  NoContent: (res) => {
    return res.status(204).json();
  },

  // 400 Bad request
  BadRequest: (res, message = "Bad request") => {
    return res.status(400).json({ message: message });
  },

  // 401 Unauthorized
  Unauthorized: (res, message = "Unauthorized access") => {
    return res.status(401).json({ message: message });
  },

  // 403 Forbidden
  Forbidden: (res, message = "Forbidden Access") => {
    return res.status(403).json({ message: message });
  },

  // 404 Not found
  NotFound: (res, message = "Not found") => {
    return res.status(404).json({ message: message });
  },

  // 415 Unsupported media type
  UnsupportedMediaType: (res, message = "Unsupported media type") => {
    return res.status(415).json({ message: message });
  },

  // 422 Unprocessable Entity
  UnprocessableEntity: (res, errors) => {
    return res.status(422).json({ errors: errors });
  },

  // 500 Server error
  ServerError: (res, err, message = "Internal server error") => {
    console.error(err.message.red);
    return res.status(500).json({ message: message });
  },
};
