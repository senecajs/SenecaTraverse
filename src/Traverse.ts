/* Copyright © 2025 Seneca Project Contributors, MIT License. */

type Entity = string

type Relation = [Entity, Entity]

type Parental = Relation[]

type TraverseOptionsFull = {
  debug: boolean
  relations: {
    parental: Parental
  }
}

export type TraverseOptions = Partial<TraverseOptionsFull>

function Traverse(this: any, options: TraverseOptionsFull) {
  const seneca: any = this

  const { Default } = seneca.valid

  seneca.fix('sys:traverse')
    .message('find:deps', msgFindDeps)

  async function msgFindDeps(this: any, msg: any) {
    const seneca = this

    // console.log('nodes ', options.relations.parental)


    return {
      ok: true, deps: []
    }

  }
}

// Default options.
const defaults: TraverseOptionsFull = {
  // TODO: Enable debug logging
  debug: false,
  relations: {
    parental: [
      // TODO: define standard relations
      // ['sys/user', 'sys/login'],
      // ['ledger/book', 'ledger/credit'],
      // ['ledger/book', 'ledger/debit']
    ]
  }
}

Object.assign(Traverse, { defaults })

export default Traverse

if ('undefined' !== typeof module) {
  module.exports = Traverse
}
