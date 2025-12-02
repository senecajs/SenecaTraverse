"use strict";
/* Copyright © 2025 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
function Traverse(options) {
    const seneca = this;
    const { Default } = seneca.valid;
    seneca.fix('sys:traverse')
        .message('find:deps', msgFindDeps);
    async function msgFindDeps(msg) {
        const seneca = this;
        // console.log('nodes ', options.relations.parental)
        return {
            ok: true, deps: []
        };
    }
}
// Default options.
const defaults = {
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
};
Object.assign(Traverse, { defaults });
exports.default = Traverse;
if ('undefined' !== typeof module) {
    module.exports = Traverse;
}
//# sourceMappingURL=Traverse.js.map