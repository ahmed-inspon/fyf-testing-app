import {mongoose} from 'mongoose';

const schema = new mongoose.Schema({
    shop: String,
    unit: String,
    fontColors:String,
    bgColors:String,
    appearance:JSON
});

const store_settings = mongoose.model('store_settings', schema);

export default store_settings;
