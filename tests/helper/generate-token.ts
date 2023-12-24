require('dotenv').config()
import * as jwt  from 'jsonwebtoken';
export  function generateToken(payload: { groupIds:number[], id:number }) {
	return  jwt.sign(payload, process.env.SECRET!, { algorithm: 'HS256' });
}




