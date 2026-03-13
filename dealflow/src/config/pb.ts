import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://api.hes-consultancy-international.com';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

export default pb;
