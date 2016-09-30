import test from 'ava';
import deepKey from '../deepKey'

const config = {
  aa: {
    bb: {
      cc: {
        aa: {
          bb: 123
        }
      }
    },
    aa: 123,
    nn: null,
  }
}

test('deepKey', t => {
  deepKey.set(config, 'aa.bb.cc.aa.bb', 45)
  const v = deepKey.get(config, 'aa.bb.cc.aa.bb')

  t.is(v, 45)

  t.deepEqual(config, {
    aa: {
      bb: {
        cc: {
          aa: {
            bb: 45
          }
        }
      },
      aa: 123,
      nn: null,
    }
  })

  deepKey.set(config, 'aa.bb.cc', 'test')
  t.is(deepKey.get(config, 'aa.bb.cc'), 'test')

  deepKey.set(config, 'aa.dddd', 'test2')
  t.is(deepKey.get(config, 'aa.dddd'), 'test2')

  t.is(deepKey.get(config, 'aa.aa'), 123)
  t.is(deepKey.get(config, 'aa.nn'), null)
  console.log(deepKey.get(config, 'aa.aa'))
})
