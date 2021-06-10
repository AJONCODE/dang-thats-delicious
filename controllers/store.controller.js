exports.homePage = (req, res) => {
    res.render('hello', {
        title: 'I Love Food! ',
        name: 'AJ',
        dog: req.query.dog || 'MAX',
    });
};