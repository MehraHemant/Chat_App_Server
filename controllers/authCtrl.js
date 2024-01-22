import { genAccessToken } from '../middlewares/tokens.js';
import user from '../models/userModel.js'
import expressAsyncHandler from 'express-async-handler';


export const authCtrl = {

  login: expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      const findUser = await user.findOne({ email });
      if (!findUser || !await findUser.isPasswordMatch(password)) {
        throw new Error("Invalid Credentials")
      }
      const accessToken = genAccessToken(findUser?._id);
      res.send({ ...findUser._doc, accessToken });
    } catch (error) {
      throw new Error(error);
    }
  }),

  register: expressAsyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const emailExist = await user.findOne({ email });
      if (emailExist) { throw new Error("Email Already Exist, Try to login") }
      const newUser = await user.create(req.body)
      const accessToken = genAccessToken(newUser._id);
      res.send({ ...newUser._doc, accessToken, password: undefined })
    } catch (error) { throw new Error(error) }
  }),
  //  /api/user?search=name
  allUsers: expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search && {
      $or: [{ name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }]
    }
    const users = await user.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users);
  }),

  getAdmin: expressAsyncHandler(async (req, res) => {
    res.send(req.user);
  })
}