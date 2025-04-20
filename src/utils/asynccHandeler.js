/// async handeler function is returning a callback which can acees fn becuse of closure property
// const asyncHandler = (fn)=>{return async ()=>{}}
////1st way to write async handler function
/*
export const asyncHandler = (fn)=> async (req,res,next)=>{
 try{
  await fn(req,res,next)
 }
 catch(err){
   res.status(err.code || 500).json({
    sucess:false,
    message:err.message || "Internal server error",
 })


}
}*/
////2nd way to write async handler function
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
