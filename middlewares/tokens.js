import jwt from 'jsonwebtoken';

export const genAccessToken = (id) =>{
    return jwt.sign({id}, process.env.ACCESSTOKENSECRET, {expiresIn: '1d'})
}

export const genRefreshToken = (id) =>{
    return jwt.sign({id}, process.env.REFRESHTOKENSECRET, {expiresIn: '30d'})
}