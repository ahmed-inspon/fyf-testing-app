import {mongoose} from 'mongoose';

const schema = new mongoose.Schema({
    shop: String,
    size: String,
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
