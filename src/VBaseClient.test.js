import test from 'ava'
import {PassThrough} from 'stream'
import {createServer} from 'http'
import {createGunzip} from 'zlib'
import VBaseClient from './VBaseClient'

test('saveFile streams a file', async t => {
  t.plan(5)
  const requestHandler = (req, res) => {
    t.is(req.headers['content-type'], 'text/plain; charset=utf-8')
    t.is(req.url, '/account/workspace/buckets/render/files/test.txt')
    t.is(req.headers['content-encoding'], 'gzip')
    t.is(req.headers['transfer-encoding'], 'chunked')
    let data = ''
    const gz = createGunzip()
    req.pipe(gz)
    gz.on('data', c => { data += c })
    gz.on('end', () => {
      t.is(data, 'test')
      res.end()
    })
  }
  const options = {
    authToken: 'token',
    userAgent: 'agent',
    accept: 'application/vnd.vtex.sppa.v4+json',
  }
  const client = new VBaseClient('http://localhost:13379', options)
  const pass = new PassThrough()
  const server = createServer(requestHandler)
  server.listen(13379)
  const reply = client.saveFile('account', 'workspace', 'render', 'test.txt', pass)
  pass.write(new Buffer('test', 'utf8'))
  pass.end()
  await reply
  server.close()
})

test('saveFile streams a file without gzip', async t => {
  t.plan(5)
  const requestHandler = (req, res) => {
    t.is(req.headers['content-type'], 'text/plain; charset=utf-8')
    t.is(req.url, '/account/workspace/buckets/render/files/test.txt')
    t.is(req.headers['content-encoding'], undefined)
    t.is(req.headers['transfer-encoding'], 'chunked')
    let data = ''
    req.on('data', c => { data += c })
    req.on('end', () => {
      t.is(data, 'test')
      res.end()
    })
  }
  const options = {
    authToken: 'token',
    userAgent: 'agent',
    accept: 'application/vnd.vtex.sppa.v4+json',
  }
  const client = new VBaseClient('http://localhost:13380', options)
  const pass = new PassThrough()
  const server = createServer(requestHandler)
  server.listen(13380)
  const reply = client.saveFile('account', 'workspace', 'render', 'test.txt', pass, false)
  pass.write(new Buffer('test', 'utf8'))
  pass.end()
  await reply
  server.close()
})
