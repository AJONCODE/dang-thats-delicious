exports.myMiddleware = (req, res, next) => {
    req.name = 'AJONCODE';
    // res.cookie('name', 'AJONCODE is cool!', { maxAge: 900000000 });
    next();
}

exports.homePage = (req, res) => {
    console.info('req.name: ', req.name);
    res.render('hello', {
        title: 'I Love Food! ',
        name: 'AJ',
        dog: req.query.dog || 'MAX',
    });
};