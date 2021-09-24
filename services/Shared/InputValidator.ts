import { Hotel } from './Model'


export class MissingFieldError extends Error {}

export function validateAsHotelEntry(arg: any){
    if(!(arg as Hotel).name){
        throw new MissingFieldError('Value for name required!')
    }
    if(!(arg as Hotel).location){
        throw new MissingFieldError('Value for location required!')
    }
    if(!(arg as Hotel).hotelId){
        throw new MissingFieldError('Value for hotelId required!')
    }
}