// /**
//  * auth.js
//  * @description :: functions used in authentication
//  */


import jwt from 'jsonwebtoken'
// const AppError = require('../utils/error/AppError')
import {  JWT } from "../constants/authConstant.js";
// const signToken = async(id) => {
//     return await jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN
//     })
// }

export const generateToken  = async (user,SECRET_KEY,expiresIn) => {
  return await jwt.sign(user, SECRET_KEY, expiresIn ? { expiresIn } : {});
}; 

export const adminSignToken = async(id) =>{
  return await jwt.sign({ id }, process.env.JWT_SECRET , {
    expiresIn: '7d'
})
} 



export const verifyUserToken = async (token, res) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT.USER_SECRET, (err, decoded) => {
      if (err) {
        res.badRequest({ message: "Token is not accessible!" });
        reject(new Error("Token verification failed"));
      } else {
        resolve(decoded);
      }
    });
  });
};
export const verifyAdminToken = async (token, res) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.badRequest({ message: "Token is not accessible!" });
        reject(new Error("Token verification failed"));
      } else {
        resolve(decoded);
      }
    });
  });
};
// const verifyMasterToken = async (token, res) => {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.JWT_SECRET_MASTER, (err, decoded) => {
//       if (err) {
      
//         res.badRequest({ message: "Token is not accessible!" });
//         reject(new Error("Token verification failed"));
//       } else {
//         resolve(decoded);
//       }
//     });
//   });
// };

