import { HotelStack } from "./HotelStack";
import  { App } from 'aws-cdk-lib'

const app = new App()
new HotelStack(app, 'Hotel-Booking', {
    stackName:'HotelBooking'
}) 