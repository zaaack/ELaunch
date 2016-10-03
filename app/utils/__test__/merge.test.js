import test from 'ava'
import { merge, getType } from '../merge'

test('merge', t => {
  const dst = {
    aa: 123,
    cc: {
      dd: 123,
      ee: 'aaa'
    }
  }
  const merged = merge(dst, {
    bb: 'aa',
  }, {
    cc: {
      ee: 123,
      ff: 123
    },
    dd: { ab: 12, cd: null, ef: { dd: 11, cc: { d: 12 } } }
  })

  t.is(merged, dst)
  t.deepEqual(merged, {
    aa: 123,
    bb: 'aa',
    cc: {
      dd: 123,
      ee: 123,
      ff: 123
    },
    dd: { ab: 12, cd: null, ef: { dd: 11, cc: { d: 12 } } }
  })
})

test('getType', t => {

  t.is(getType(f => f), 'function')
  t.is(getType(null), 'null')
  t.is(getType(undefined), 'undefined')
  t.is(getType(void 0), 'undefined')
  t.is(getType(1), 'number')
  t.is(getType(Number(2)), 'number')
  t.is(getType(''), 'string')
  t.is(getType(String(2)), 'string')
  t.is(getType([]), 'array')
  t.is(getType({}), 'object')
})
