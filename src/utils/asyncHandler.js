// ------- Method 01 -------

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch(err => next(err));
  }
}




// ----- Method 02 -----

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     await requestHandler(req, res, next);
//   } catch(err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message || 'Internal Server Error!!'
//     });
//   }
// }

module.exports = asyncHandler;