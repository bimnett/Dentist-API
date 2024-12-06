import axios from 'axios';
import { API_URL } from './secrets.example';

export const Api = axios.create({
    baseURL: API_URL
});
  

export const getDentistSchedule = async (dentistId) => {

    try{
        const response = await Api.get('');
        return response.data;
    }catch(err){
        throw err;
    }
}