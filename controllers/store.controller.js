exports.homePage = (req, res) => {
	console.info('req.name: ', req.name);
	res.render('hello', {
			title: 'I Love Food! ',
			name: 'AJ',
			dog: req.query.dog || 'MAX',
	});
};

exports.addStore = (req, res) => {
  res.render('editStore', {
		title: 'Add Store',
	});
};

exports.createStore = (req, res) => {
	res.json(req.body);
};