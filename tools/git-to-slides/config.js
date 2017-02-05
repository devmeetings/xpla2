const Joi = require('joi');

const branchSchema = Joi.object().keys({
  name: Joi.string().regex(/^[a-z0-9._-]+$/i).required().description('Name of the branch or directory'),
  title: Joi.string().regex(/^[a-z0-9._ -]+$/i).description('Human readable name of that branch/directory')
});

const schema = Joi.object().keys({
  'xpla.version': Joi.number().allow(1).required(),
  name: Joi.string().required().description('Name of the workshop'),
  date: Joi.string().description('Date of the workshop (your preferred format)'),
  link: Joi.string().description('Short link to the workshop'),
  runner: Joi.string().description('One of allowed runners. NOTE per-slide settings may override this.'),
  runServer: Joi.string().description('Run server to use (Do not set if you don\'t know what it is)'),
  ignore: Joi.array().items(Joi.string()).description('Array of files to ignore while generating slides.'),
  dirs: Joi.array().items(branchSchema).min(1).description('List of directories to process'),
  branches: Joi.array().items(branchSchema).min(1).description('List of branches to process')
}).xor('branches', 'dirs');

module.exports = function validate (config) {
  return Joi.validate(config, schema, {
    convert: false,
    allowUnknown: false
  });
};
