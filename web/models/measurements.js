import { DataType } from '@shopify/shopify-api';
import {mongoose} from 'mongoose';

const schema = new mongoose.Schema({
    title:String,
    shop: String,
    size: String,
    unit: String,
    type:String,
    sizes:JSON,
    products:JSON,
    created_at:{
        type:Date,
        default:new Date()},
    waist:Number,
    chest:Number,
    pant: Number,
    neck: Number,
    hips: Number,
    gender:{
        type:String,
        default:"m"
    }
});

const measurements = mongoose.model('measurement', schema);

export default measurements;
