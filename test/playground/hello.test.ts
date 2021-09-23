import { handler } from '../../services/HotelsTable/create';

const event = {
    body: {
        location: 'Africa'
    }
}

handler(event as any, {} as any);
