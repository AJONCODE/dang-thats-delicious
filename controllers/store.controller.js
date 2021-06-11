exports.homePage = (req, res) => {
    console.info('req.name: ', req.name);
    res.render('hello', {
        title: 'I Love Food! ',
        name: 'AJ',
        dog: req.query.dog || 'MAX',
    });
};