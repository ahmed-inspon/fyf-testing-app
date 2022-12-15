import {mongoose} from 'mongoose';

const schema = new mongoose.Schema({
    shop: {type:String},
    country:{type:String,default:null},
    city:{type:String,default:null},
    phone:{type:String,default:null},
    shop_owner:{type:String,default:null},
    plan_name:{type:String,default:null},
    email:{type:String,default:null},
    first_installed_at:{type:Date,default:null},
    last_installed_at:{type:Date,default:null},
    uninstalled_at:{type:Date,default:null},
    installed_days:{type:Number,default:0},
    installed:{type:Boolean,default:false},
    app_reviewed:{type:Boolean,default:false},
    billed:{type:Boolean,default:false},
    super_admin:{type:Boolean,default:false}
});

const stores = mongoose.model('stores', schema);

export default stores;
