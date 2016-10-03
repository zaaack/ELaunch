import test from 'ava'
import promisify from '../promisify'

function asyncFunc(hasError, b, cb) {
  setTimeout(() => {
    const err = hasError ? new Error('err1') : null
    cb(err, b)
  }, 10)
}

const obj = {
  prop: 'test',
  asyncMethod(hasError, cb) {
    setTimeout(() => {
      const err = hasError ? new Error('err1') : null
      cb(err, this.prop)
    })
  },
}


const piAsyncFunc = promisify(asyncFunc)
const piAsyncMethod = promisify(obj.asyncMethod, obj)

test('promisify', async function(t) {
  const b = await piAsyncFunc(false, 15)
  t.is(b, 15)
  t.throws(piAsyncFunc(true, 16))

  const methodRet = await piAsyncMethod(false)
  t.is(methodRet, obj.prop)

  t.throws(piAsyncMethod(true))
})
