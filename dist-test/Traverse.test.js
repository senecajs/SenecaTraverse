"use strict";
/* Copyright © 2025 Seneca Project Contributors, MIT License. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const code_1 = require("@hapi/code");
const seneca_1 = __importDefault(require("seneca"));
// import SenecaMsgTest from 'seneca-msg-test'
// import { Maintain } from '@seneca/maintain'
const __1 = __importDefault(require(".."));
const __2 = __importDefault(require(".."));
(0, node_test_1.describe)('Traverse', () => {
    (0, node_test_1.test)('load-plugin', async () => {
        (0, code_1.expect)(__1.default).exist();
        const seneca = (0, seneca_1.default)({ legacy: false })
            .test()
            .use('promisify')
            .use('entity')
            .use(__2.default);
        await seneca.ready();
        (0, code_1.expect)(seneca.find_plugin('Traverse')).exist();
    });
    (0, node_test_1.test)('find-deps', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar0', 'foo/bar2'],
            ['foo/bar0', 'foo/zed0'],
            // Level 1
            ['foo/bar1', 'foo/bar4'],
            ['foo/bar1', 'foo/bar5'],
            ['foo/bar2', 'foo/bar3'],
            ['foo/bar2', 'foo/bar9'],
            ['foo/zed0', 'foo/zed1'],
            // Level 2
            // Sort each level alphabetically.
            // Thus, foo/bar3 should be listed first,
            // although its parent is foo/bar2
            ['foo/bar3', 'foo/bar6'],
            ['foo/bar4', 'foo/bar7'],
            ['foo/bar5', 'foo/bar8'],
            ['foo/zed1', 'foo/zed2'],
            // Level 3
            ['foo/bar6', 'foo/bar10'],
            ['foo/bar7', 'foo/bar11'],
        ]);
    });
    (0, node_test_1.test)('find-deps-empty-list', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([]);
    });
    (0, node_test_1.test)('find-deps-no-children', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar1', 'foo/bar2'],
                    ['foo/bar2', 'foo/bar3'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([]);
    });
    (0, node_test_1.test)('find-deps-cycle', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar1', 'foo/bar2'],
                    // Cycle back to root
                    ['foo/bar2', 'foo/bar0'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        // Should only traverse once, ignoring the cycle
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar1', 'foo/bar2'],
        ]);
    });
    (0, node_test_1.test)('find-deps-cycle-middle', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar1', 'foo/bar2'],
                    ['foo/bar2', 'foo/bar3'],
                    // Cycle bar1 -> bar2 -> bar3 -> bar1
                    ['foo/bar3', 'foo/bar1'],
                    ['foo/bar2', 'foo/bar4'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // Each node visited only once despite cycle
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar1', 'foo/bar2'],
            ['foo/bar2', 'foo/bar3'],
            ['foo/bar2', 'foo/bar4'],
        ]);
    });
    (0, node_test_1.test)('find-deps-linear', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar1', 'foo/bar2'],
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar3', 'foo/bar4'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar1', 'foo/bar2'],
            ['foo/bar2', 'foo/bar3'],
            ['foo/bar3', 'foo/bar4'],
        ]);
    });
    (0, node_test_1.test)('find-deps-duplicate', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    // Duplicate
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar1', 'foo/bar2'],
                    // Duplicate
                    ['foo/bar1', 'foo/bar2'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar1', 'foo/bar2'],
        ]);
    });
    (0, node_test_1.test)('find-deps-convergent', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar3'],
                    // bar3 reachable from two paths
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar3', 'foo/bar4'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        // bar3 should only appear once (first path wins)
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar0', 'foo/bar2'],
            ['foo/bar1', 'foo/bar3'],
            ['foo/bar3', 'foo/bar4'],
        ]);
    });
    (0, node_test_1.test)('find-deps-two-convergent', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar0', 'foo/bar3'],
                    ['foo/bar1', 'foo/bar4'],
                    // bar4 from two parents
                    ['foo/bar2', 'foo/bar4'],
                    ['foo/bar3', 'foo/bar5'],
                    ['foo/bar4', 'foo/bar6'],
                    // bar6 from two parents at different levels
                    ['foo/bar5', 'foo/bar6'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar0', 'foo/bar2'],
            ['foo/bar0', 'foo/bar3'],
            ['foo/bar1', 'foo/bar4'],
            ['foo/bar3', 'foo/bar5'],
            ['foo/bar4', 'foo/bar6'],
        ]);
    });
    (0, node_test_1.test)('find-deps-self-ref', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar0', 'foo/bar1'],
                    // Self loop
                    ['foo/bar1', 'foo/bar1'],
                    ['foo/bar1', 'foo/bar2'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([
            ['foo/bar0', 'foo/bar1'],
            ['foo/bar1', 'foo/bar2'],
        ]);
    });
    (0, node_test_1.test)('find-deps-all-default', async () => {
        const seneca = makeSeneca().use(__2.default);
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps');
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([]);
    });
    (0, node_test_1.test)('find-deps-empty-list', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar0',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([]);
    });
    (0, node_test_1.test)('find-deps-l1', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar1',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar1', 'foo/bar4'],
            ['foo/bar1', 'foo/bar5'],
            // Level 1
            ['foo/bar4', 'foo/bar7'],
            ['foo/bar5', 'foo/bar8'],
            // Level 2
            ['foo/bar7', 'foo/bar11'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l1-convergent', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                    ['foo/bar4', 'foo/bar12'],
                    // bar12 converges from bar4 and bar5
                    ['foo/bar5', 'foo/bar12'],
                    ['foo/bar12', 'foo/bar13'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar1',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar1', 'foo/bar4'],
            ['foo/bar1', 'foo/bar5'],
            // Level 1
            ['foo/bar4', 'foo/bar7'],
            ['foo/bar4', 'foo/bar12'],
            ['foo/bar5', 'foo/bar8'],
            // Level 2
            ['foo/bar7', 'foo/bar11'],
            ['foo/bar12', 'foo/bar13'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l1-cycle', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                    // Cycle: bar1 -> bar4 -> bar7 -> bar1
                    ['foo/bar7', 'foo/bar1'],
                    ['foo/bar8', 'foo/bar12'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar1',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar1', 'foo/bar4'],
            ['foo/bar1', 'foo/bar5'],
            // Level 1
            ['foo/bar4', 'foo/bar7'],
            ['foo/bar5', 'foo/bar8'],
            // Level 2
            ['foo/bar7', 'foo/bar11'],
            ['foo/bar8', 'foo/bar12'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l2', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar3',
        });
        // console.log('RES', res)
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar3', 'foo/bar6'],
            // Level 1
            ['foo/bar6', 'foo/bar10'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l2-convergent', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                    ['foo/bar3', 'foo/bar12'],
                    ['foo/bar6', 'foo/bar13'],
                    ['foo/bar10', 'foo/bar14'],
                    // bar14 converges from bar10 and bar12
                    ['foo/bar12', 'foo/bar14'],
                    ['foo/bar14', 'foo/bar15'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar3',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar3', 'foo/bar6'],
            ['foo/bar3', 'foo/bar12'],
            // Level 1
            ['foo/bar6', 'foo/bar10'],
            ['foo/bar6', 'foo/bar13'],
            ['foo/bar12', 'foo/bar14'],
            // Level 2
            ['foo/bar14', 'foo/bar15'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l2-cycle', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                    ['foo/bar10', 'foo/bar12'],
                    // Cycle: bar3 -> bar6 -> bar10 -> bar12 -> bar3
                    ['foo/bar12', 'foo/bar3'],
                    ['foo/bar10', 'foo/bar13'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar3',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar3', 'foo/bar6'],
            // Level 1
            ['foo/bar6', 'foo/bar10'],
            // Level 2
            ['foo/bar10', 'foo/bar12'],
            ['foo/bar10', 'foo/bar13'],
        ]);
    });
    (0, node_test_1.test)('find-deps-l2-multi-level-convergent', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['foo/bar2', 'foo/bar3'],
                    ['foo/bar0', 'foo/bar1'],
                    ['foo/bar0', 'foo/bar2'],
                    ['foo/bar1', 'foo/bar4'],
                    ['foo/bar1', 'foo/bar5'],
                    ['foo/bar3', 'foo/bar6'],
                    ['foo/bar4', 'foo/bar7'],
                    ['foo/bar5', 'foo/bar8'],
                    ['foo/bar0', 'foo/zed0'],
                    ['foo/zed0', 'foo/zed1'],
                    ['foo/zed1', 'foo/zed2'],
                    ['bar/baz0', 'bar/baz1'],
                    ['qux/test', 'qux/prod'],
                    ['foo/bar2', 'foo/bar9'],
                    ['foo/bar6', 'foo/bar10'],
                    ['foo/bar7', 'foo/bar11'],
                    ['foo/bar3', 'foo/bar12'],
                    ['foo/bar3', 'foo/bar13'],
                    ['foo/bar12', 'foo/bar14'],
                    // Second path to bar14
                    ['foo/bar13', 'foo/bar14'],
                    // Third path to bar14
                    ['foo/bar6', 'foo/bar14'],
                    ['foo/bar14', 'foo/bar15'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'foo/bar3',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['foo/bar3', 'foo/bar6'],
            ['foo/bar3', 'foo/bar12'],
            ['foo/bar3', 'foo/bar13'],
            // Level 1
            ['foo/bar6', 'foo/bar10'],
            ['foo/bar12', 'foo/bar14'],
            // Level 2
            ['foo/bar14', 'foo/bar15'],
        ]);
    });
    (0, node_test_1.test)('find-deps-single-cycle', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['A', 'B'],
                    ['A', 'C'],
                    ['C', 'E'],
                    ['C', 'D'],
                    ['E', 'G'],
                    ['E', 'F'],
                    ['F', 'H'],
                    ['C', 'A'],
                    ['N', 'M'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'C',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['C', 'A'],
            ['C', 'D'],
            ['C', 'E'],
            // Level 1
            ['A', 'B'],
            ['E', 'F'],
            ['E', 'G'],
            // Level 2
            ['F', 'H'],
        ]);
    });
    (0, node_test_1.test)('find-deps-single-missing-node', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['A', 'B'],
                    ['B', 'C'],
                    ['D', 'E'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'X',
        });
        // X has no children
        (0, code_1.expect)(res.deps).equal([]);
    });
    (0, node_test_1.test)('find-deps-deep-linear-chain', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['node0', 'node1'],
                    ['node1', 'node2'],
                    ['node2', 'node3'],
                    ['node3', 'node4'],
                    ['node4', 'node5'],
                    ['node5', 'node6'],
                    ['node6', 'node7'],
                    ['node7', 'node8'],
                    ['node8', 'node9'],
                    ['node9', 'node10'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'node0',
        });
        (0, code_1.expect)(res.deps).equal([
            ['node0', 'node1'],
            ['node1', 'node2'],
            ['node2', 'node3'],
            ['node3', 'node4'],
            ['node4', 'node5'],
            ['node5', 'node6'],
            ['node6', 'node7'],
            ['node7', 'node8'],
            ['node8', 'node9'],
            ['node9', 'node10'],
        ]);
    });
    (0, node_test_1.test)('find-deps-binary-tree', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['A', 'B'],
                    ['A', 'C'],
                    ['B', 'D'],
                    ['B', 'E'],
                    ['C', 'F'],
                    ['C', 'G'],
                    ['D', 'H'],
                    ['D', 'I'],
                    ['E', 'J'],
                    ['E', 'K'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'A',
        });
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['A', 'B'],
            ['A', 'C'],
            // Level 1
            ['B', 'D'],
            ['B', 'E'],
            ['C', 'F'],
            ['C', 'G'],
            // Level 2
            ['D', 'H'],
            ['D', 'I'],
            ['E', 'J'],
            ['E', 'K'],
        ]);
    });
    (0, node_test_1.test)('find-deps-diamond-pattern', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['A', 'B'],
                    ['A', 'C'],
                    ['B', 'D'],
                    ['C', 'D'],
                    ['D', 'E'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'A',
        });
        // D is reached first from B (alphabetically first)
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['A', 'B'],
            ['A', 'C'],
            // Level 1 - D reached via B
            ['B', 'D'],
            // Level 2
            ['D', 'E'],
        ]);
    });
    (0, node_test_1.test)('find-deps-mixed-alph-sort', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['root', 'node10'],
                    ['root', 'node2'],
                    ['root', 'node1'],
                    ['root', 'node20'],
                    ['node1', 'child2'],
                    ['node2', 'child1'],
                    ['node10', 'child10'],
                    ['node20', 'child20'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'root',
        });
        // Natural sorting: node1, node2, node10, node20
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['root', 'node1'],
            ['root', 'node2'],
            ['root', 'node10'],
            ['root', 'node20'],
            // Level 1
            ['node1', 'child2'],
            ['node2', 'child1'],
            ['node10', 'child10'],
            ['node20', 'child20'],
        ]);
    });
    (0, node_test_1.test)('find-deps-all-nodes-converge-to-one', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    ['root', 'A'],
                    ['root', 'B'],
                    ['root', 'C'],
                    ['A', 'target'],
                    ['B', 'target'],
                    ['C', 'target'],
                    ['target', 'end'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'root',
        });
        // target reached first via A (alphabetically first)
        (0, code_1.expect)(res.deps).equal([
            // Level 0
            ['root', 'A'],
            ['root', 'B'],
            ['root', 'C'],
            // Level 1 - target via A
            ['A', 'target'],
            // Level 2
            ['target', 'end'],
        ]);
    });
    (0, node_test_1.test)('find-deps-deep-10-levels-complex', async () => {
        const seneca = makeSeneca().use(__2.default, {
            relations: {
                parental: [
                    // Level 0: root → simple names
                    ['root', 'alpha'],
                    ['root', 'beta'],
                    ['root', 'gamma'],
                    // Level 1: simple → mixed format
                    ['alpha', 'sys/config'],
                    ['alpha', 'A'],
                    ['beta', 'sys/auth'],
                    ['beta', 'lib/utils'],
                    ['gamma', 'B'],
                    // Level 2: mixed → namespaced with numbers
                    ['sys/config', 'app/module1'],
                    ['sys/config', 'app/module2'],
                    ['A', 'foo/bar1'],
                    ['sys/auth', 'auth/provider10'],
                    ['sys/auth', 'auth/provider2'],
                    ['lib/utils', 'C'],
                    ['B', 'foo/baz5'],
                    // Level 3: deeper nesting
                    ['app/module1', 'core/service10'],
                    ['app/module1', 'core/service2'],
                    ['app/module2', 'data/processor1'],
                    ['foo/bar1', 'foo/bar10'],
                    ['foo/bar1', 'foo/bar2'],
                    ['auth/provider2', 'auth/token/handler'],
                    ['auth/provider10', 'D'],
                    ['C', 'lib/helper3'],
                    ['foo/baz5', 'dead/end1'], // Dead end branch
                    // Level 4
                    ['core/service2', 'db/connection5'],
                    ['core/service2', 'db/connection50'],
                    ['core/service10', 'cache/redis'],
                    ['data/processor1', 'queue/worker1'],
                    ['data/processor1', 'queue/worker10'],
                    ['foo/bar2', 'E'],
                    ['foo/bar10', 'foo/bar100'],
                    ['auth/token/handler', 'security/validator'],
                    ['D', 'monitor/logger'],
                    ['lib/helper3', 'lib/helper30'],
                    // Dead end: dead/end1 has no children
                    // Level 5
                    ['db/connection5', 'pool/manager1'],
                    ['db/connection50', 'F'],
                    ['cache/redis', 'cache/redis/cluster'],
                    ['queue/worker1', 'task/executor2'],
                    ['queue/worker10', 'task/executor20'],
                    ['E', 'report/generator'],
                    ['foo/bar100', 'foo/bar1000'],
                    ['security/validator', 'G'],
                    ['monitor/logger', 'log/stream5'],
                    ['lib/helper30', 'lib/helper300'],
                    // Level 6
                    ['pool/manager1', 'resource/allocator'],
                    ['F', 'backup/service'],
                    ['cache/redis/cluster', 'node/shard1'],
                    ['cache/redis/cluster', 'node/shard10'],
                    ['task/executor2', 'H'],
                    ['task/executor20', 'event/handler'],
                    ['report/generator', 'pdf/renderer'],
                    ['foo/bar1000', 'final/component1'],
                    ['G', 'audit/trail'],
                    ['log/stream5', 'storage/bucket10'],
                    ['log/stream5', 'storage/bucket2'],
                    // Cycle: lib/helper300 → sys/config (already visited at level 1)
                    ['lib/helper300', 'sys/config'],
                    ['lib/helper300', 'metrics/collector'],
                    // Level 7
                    ['resource/allocator', 'I'],
                    ['backup/service', 'snapshot/manager'],
                    ['node/shard1', 'replica/node1'],
                    ['node/shard10', 'replica/node10'],
                    ['H', 'notification/service'],
                    ['event/handler', 'webhook/dispatcher'],
                    ['pdf/renderer', 'template/engine'],
                    ['final/component1', 'J'],
                    ['audit/trail', 'compliance/checker'],
                    ['storage/bucket2', 'archive/tier1'],
                    ['storage/bucket10', 'archive/tier10'],
                    ['metrics/collector', 'stats/aggregator'],
                    // Level 8
                    ['I', 'health/check'],
                    ['snapshot/manager', 'K'],
                    ['replica/node1', 'sync/protocol'],
                    ['replica/node10', 'sync/protocol'], // Convergent path
                    ['notification/service', 'email/sender'],
                    ['webhook/dispatcher', 'http/client'],
                    ['template/engine', 'render/pipeline'],
                    ['J', 'output/formatter'],
                    ['compliance/checker', 'policy/enforcer'],
                    ['archive/tier1', 'L'],
                    ['archive/tier10', 'cold/storage'],
                    ['stats/aggregator', 'dashboard/api'],
                    // Level 9
                    ['health/check', 'ping/service'],
                    ['K', 'recovery/manager'],
                    ['sync/protocol', 'consensus/algorithm'], // From convergent paths
                    ['email/sender', 'smtp/gateway'],
                    ['http/client', 'retry/logic'],
                    ['render/pipeline', 'M'],
                    ['output/formatter', 'serializer/json'],
                    ['policy/enforcer', 'rule/engine'],
                    ['L', 'tape/backup'],
                    ['cold/storage', 'glacier/vault'],
                    ['dashboard/api', 'visualization/service'],
                    // Level 10 (final level)
                    ['ping/service', 'endpoint/monitor'],
                    ['recovery/manager', 'failover/system'],
                    ['consensus/algorithm', 'raft/implementation'],
                    ['smtp/gateway', 'mail/queue'],
                    ['retry/logic', 'exponential/backoff'],
                    ['M', 'final/output'],
                    ['serializer/json', 'schema/validator'],
                    ['rule/engine', 'decision/tree'],
                    ['tape/backup', 'offsite/storage'],
                    ['glacier/vault', 'deep/archive'],
                    ['visualization/service', 'chart/renderer'],
                ],
            },
        });
        await seneca.ready();
        const res = await seneca.post('sys:traverse,find:deps', {
            rootEntity: 'root',
        });
        (0, code_1.expect)(res.deps).equal([
            // ========== LEVEL 0 ==========
            ['root', 'alpha'],
            ['root', 'beta'],
            ['root', 'gamma'],
            // ========== LEVEL 1 ==========
            ['alpha', 'A'],
            ['alpha', 'sys/config'],
            ['beta', 'lib/utils'],
            ['beta', 'sys/auth'],
            ['gamma', 'B'],
            // ========== LEVEL 2 ==========
            ['A', 'foo/bar1'],
            ['B', 'foo/baz5'],
            ['lib/utils', 'C'],
            ['sys/auth', 'auth/provider2'],
            ['sys/auth', 'auth/provider10'],
            ['sys/config', 'app/module1'],
            ['sys/config', 'app/module2'],
            // ========== LEVEL 3 ==========
            ['app/module1', 'core/service2'],
            ['app/module1', 'core/service10'],
            ['app/module2', 'data/processor1'],
            ['auth/provider2', 'auth/token/handler'],
            ['auth/provider10', 'D'],
            ['C', 'lib/helper3'],
            ['foo/bar1', 'foo/bar2'],
            ['foo/bar1', 'foo/bar10'],
            ['foo/baz5', 'dead/end1'],
            // ========== LEVEL 4 ==========
            ['auth/token/handler', 'security/validator'],
            ['core/service2', 'db/connection5'],
            ['core/service2', 'db/connection50'],
            ['core/service10', 'cache/redis'],
            ['D', 'monitor/logger'],
            ['data/processor1', 'queue/worker1'],
            ['data/processor1', 'queue/worker10'],
            ['foo/bar2', 'E'],
            ['foo/bar10', 'foo/bar100'],
            ['lib/helper3', 'lib/helper30'],
            // Note: dead/end1 has no children (dead end)
            // ========== LEVEL 5 ==========
            ['cache/redis', 'cache/redis/cluster'],
            ['db/connection5', 'pool/manager1'],
            ['db/connection50', 'F'],
            ['E', 'report/generator'],
            ['foo/bar100', 'foo/bar1000'],
            ['lib/helper30', 'lib/helper300'],
            ['monitor/logger', 'log/stream5'],
            ['queue/worker1', 'task/executor2'],
            ['queue/worker10', 'task/executor20'],
            ['security/validator', 'G'],
            // ========== LEVEL 6 ==========
            ['cache/redis/cluster', 'node/shard1'],
            ['cache/redis/cluster', 'node/shard10'],
            ['F', 'backup/service'],
            ['foo/bar1000', 'final/component1'],
            ['G', 'audit/trail'],
            // Note: lib/helper300 → sys/config creates cycle (sys/config visited at level 1)
            ['lib/helper300', 'metrics/collector'],
            ['log/stream5', 'storage/bucket2'],
            ['log/stream5', 'storage/bucket10'],
            ['pool/manager1', 'resource/allocator'],
            ['report/generator', 'pdf/renderer'],
            ['task/executor2', 'H'],
            ['task/executor20', 'event/handler'],
            // ========== LEVEL 7 ==========
            ['audit/trail', 'compliance/checker'],
            ['backup/service', 'snapshot/manager'],
            ['event/handler', 'webhook/dispatcher'],
            ['final/component1', 'J'],
            ['H', 'notification/service'],
            ['metrics/collector', 'stats/aggregator'],
            ['node/shard1', 'replica/node1'],
            ['node/shard10', 'replica/node10'],
            ['pdf/renderer', 'template/engine'],
            ['resource/allocator', 'I'],
            ['storage/bucket2', 'archive/tier1'],
            ['storage/bucket10', 'archive/tier10'],
            // ========== LEVEL 8 ==========
            ['archive/tier1', 'L'],
            ['archive/tier10', 'cold/storage'],
            ['compliance/checker', 'policy/enforcer'],
            ['I', 'health/check'],
            ['J', 'output/formatter'],
            ['notification/service', 'email/sender'],
            ['replica/node1', 'sync/protocol'],
            // Note: replica/node10 → sync/protocol (convergent - sync/protocol already visited)
            ['snapshot/manager', 'K'],
            ['stats/aggregator', 'dashboard/api'],
            ['template/engine', 'render/pipeline'],
            ['webhook/dispatcher', 'http/client'],
            // ========== LEVEL 9 ==========
            ['cold/storage', 'glacier/vault'],
            ['dashboard/api', 'visualization/service'],
            ['email/sender', 'smtp/gateway'],
            ['health/check', 'ping/service'],
            ['http/client', 'retry/logic'],
            ['K', 'recovery/manager'],
            ['L', 'tape/backup'],
            ['output/formatter', 'serializer/json'],
            ['policy/enforcer', 'rule/engine'],
            ['render/pipeline', 'M'],
            ['sync/protocol', 'consensus/algorithm'],
            // ========== LEVEL 10 ==========
            ['consensus/algorithm', 'raft/implementation'],
            ['glacier/vault', 'deep/archive'],
            ['M', 'final/output'],
            ['ping/service', 'endpoint/monitor'],
            ['recovery/manager', 'failover/system'],
            ['retry/logic', 'exponential/backoff'],
            ['rule/engine', 'decision/tree'],
            ['serializer/json', 'schema/validator'],
            ['smtp/gateway', 'mail/queue'],
            ['tape/backup', 'offsite/storage'],
            ['visualization/service', 'chart/renderer'],
        ]);
    });
});
function makeSeneca(opts = {}) {
    const seneca = (0, seneca_1.default)({ legacy: false }).test().use('promisify').use('entity');
    return seneca;
}
//# sourceMappingURL=Traverse.test.js.map