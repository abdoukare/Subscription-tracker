import mongoose from "mongoose";
console.log('loaded subscription.model.js');
const subscriptionSchema = new mongoose.Schema({
	name: {type: String, required: [true, 'subscription name is required']},
	price: {type: Number, required: [true, 'price is required']},
	frequency:{type: String, enum:['daily', 'weekly', 'monthly', 'yearly']},
	category: {type: String, required: [true, 'category is required']},
	paymentMethod: {type: String, required: [true, 'payment method is required']},
	status: {type: String, enum:['active', 'cancelled', 'expired'], default: 'active'},
	startDate: {type: Date, 
		required:true, 
		validate:(value) => value <= new Date(),
	message: 'start date cannot be in the future'},
	renewalDate: {type: Date, 
		//required:true,
		function(value){
			return value > this.startDate;
		},
	message: 'renewal date cannot be before start date'},
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true}
}, {timestamps: true});
// auto-calculate renwal date if missing 
subscriptionSchema.pre('save', function(next) {
	if(!this.renewalDate){
		const renewalPeriods = {
			daily: 1,
			weekly: 7,
			monthly: 30,
			yearly: 365
		};
		this.renewalDate = new Date(this.startDate);
		this.renewalDate = this.startDate.setDate(this.startDate.getDate() + renewalPeriods[this.frequency]);
	}
	// auto-update renewal date if frequency changes
	if(this.renewalDate < new Date()){
		this.status = 'expired';
	}
	next();
});

const subscription = mongoose.model('Subscription', subscriptionSchema);
export default subscription;