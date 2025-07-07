
// =================================================================
// 文件: /backend/api/auth_controller.js
// 描述: 更新了模型导入路径以匹配小写文件名。
// =================================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../core/models/user'); // 路径已更新为小写

// @route   POST api/auth/register
// @desc    注册新用户
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 检查用户是否已存在
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: '该邮箱已被注册' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // 返回JWT
    const payload = {
      user: {
        id: newUser.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // token有效期1小时
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. 在数据库中通过 email 查找用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: '无效的凭证' });
        }

        // 2. 使用 bcrypt.compare 比较密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: '无效的凭证' });
        }

        // 3. 如果成功，生成并返回 JWT token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});


module.exports = router;