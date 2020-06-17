const asyncHandler = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// reference https://www.acuriousanimal.com/blog/2018/03/15/express-async-middleware
