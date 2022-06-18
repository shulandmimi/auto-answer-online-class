const delay = (time: number) => new Promise(resolve => setTimeout(() => resolve(undefined), time));
export default delay;
