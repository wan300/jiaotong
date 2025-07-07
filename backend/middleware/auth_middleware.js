
// =================================================================
// 文件: /backend/middleware/auth_middleware.js
// 描述: JWT身份验证中间件 (此文件无需更改)。
// =================================================================
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: '没有token，授权被拒绝' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token无效' });
  }
};