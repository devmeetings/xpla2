import 'babel-polyfill'

let context = require.context('.', true, /.spec\.jsx?$/)
context.keys().forEach(context)
