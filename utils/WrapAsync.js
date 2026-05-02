module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}

// It is a wrapper that catches errors in async functions so you don't have to write try/catch blocks in every single route.

// How it works:
// Takes a function (fn): You pass your async route handler into it.

// Returns a middleware: It returns a standard (req, res, next) function.

// Appends .catch(next): If your code fails or an await rejects, the error is automatically sent to your global Express error-handling middleware via next.