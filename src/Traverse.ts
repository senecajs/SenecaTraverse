/* Copyright © 2025 Seneca Project Contributors, MIT License. */

import { Optional, Skip } from 'gubu'

type Entity = string

type Relation = [Entity, Entity]

type Parental = Relation[]

type ChildrenInstances = {
  parent_id: string
  child_id: string
  parent_canon: Entity
  child_canon: Entity
}

type TraverseOptionsFull = {
  debug: boolean
  rootEntity: Entity
  relations: {
    parental: Parental
  }
}

export type TraverseOptions = Partial<TraverseOptionsFull>

function Traverse(this: any, options: TraverseOptionsFull) {
  const seneca: any = this

  // const { Default } = seneca.valid

  seneca
    .fix('sys:traverse')
    .message(
      'find:deps',
      {
        rootEntity: Optional(String),
        relations: Skip({ parental: [[String, String]] }),
      },
      msgFindDeps,
    )
    .message(
      'find:children',
      {
        rootEntity: Optional(String),
        customRef: Optional(Object),
        rootEntityId: String,
        relations: [[String, String]],
      },
      msgFindChildren,
    )

  // Returns a sorted list of entity pairs starting from a given entity.
  // In breadth-first order, sorting first by level, then alphabetically in each level.
  async function msgFindDeps(
    this: any,
    msg: {
      rootEntity?: Entity
      relations?: {
        parental: Parental
      }
    },
  ): Promise<{ ok: boolean; deps: Relation[] }> {
    // const seneca = this
    const allRelations: Parental =
      msg.relations?.parental || options.relations.parental
    const rootEntity = msg.rootEntity || options.rootEntity
    const deps: Relation[] = []

    const parentChildrenMap: Map<Entity, Entity[]> = new Map()

    for (const [parent, child] of allRelations) {
      if (!parentChildrenMap.has(parent)) {
        parentChildrenMap.set(parent, [])
      }

      parentChildrenMap.get(parent)!.push(child)
    }

    for (const children of parentChildrenMap.values()) {
      children.sort()
    }

    const visitedEntitiesSet: Set<Entity> = new Set([rootEntity])
    let currentLevel: Entity[] = [rootEntity]

    while (currentLevel.length > 0) {
      const nextLevel: Entity[] = []
      let levelDeps: Relation[] = []

      for (const parent of currentLevel) {
        const children = parentChildrenMap.get(parent) || []

        for (const child of children) {
          if (visitedEntitiesSet.has(child)) {
            continue
          }

          levelDeps.push([parent, child])
          visitedEntitiesSet.add(child)
          nextLevel.push(child)
        }
      }

      levelDeps = compareRelations(levelDeps)
      deps.push(...levelDeps)
      currentLevel = nextLevel
    }

    return {
      ok: true,
      deps,
    }
  }

  // Returns all discovered child instances with their parent relationship.
  async function msgFindChildren(
    this: any,
    msg: {
      rootEntity?: Entity
      customRef?: Record<Entity, string>
      rootEntityId: string
      relations: Relation[]
    },
  ): Promise<{
    ok: boolean
    children: ChildrenInstances[]
  }> {
    const rootEntity: Entity = msg.rootEntity || options.rootEntity
    const rootEntityId = msg.rootEntityId
    const customRef = msg.customRef || {}
    const relationsQueue = [...msg.relations]

    const result: ChildrenInstances[] = []
    const parentInstanceMap = new Map<Entity, Set<string>>()

    parentInstanceMap.set(rootEntity, new Set([rootEntityId]))

    for (const [parentCanon, childCanon] of relationsQueue) {
      const parentInstances = parentInstanceMap.get(parentCanon)

      if (!parentInstances || parentInstances.size === 0) {
        continue
      }

      const foreignRef =
        customRef[childCanon] || `${getEntityName(parentCanon)}_id`

      if (!parentInstanceMap.has(childCanon)) {
        parentInstanceMap.set(childCanon, new Set())
      }

      const childInstancesSet = parentInstanceMap.get(childCanon)

      const childQueryPromises = Array.from(parentInstances).map(
        async (parentId) => {
          const childInstances = await seneca.entity(childCanon).list$({
            [foreignRef]: parentId,
            fields$: ['id'],
          })

          return { parentId, childInstances }
        },
      )

      const queryResults = await Promise.all(childQueryPromises)

      for (const { parentId, childInstances } of queryResults) {
        for (const childInst of childInstances) {
          const childId = childInst.id

          childInstancesSet!.add(childId)

          result.push({
            parent_id: parentId,
            child_id: childId,
            parent_canon: parentCanon,
            child_canon: childCanon,
          })
        }
      }
    }

    return {
      ok: true,
      children: result,
    }
  }

  function compareRelations(relations: Relation[]): Relation[] {
    return [...relations].sort(
      (a, b) =>
        a[0].localeCompare(b[0], undefined, { numeric: true }) ||
        a[1].localeCompare(b[1], undefined, { numeric: true }),
    )
  }

  function getEntityName(entity: Entity): string {
    return entity.split('/')[1] ?? ''
  }
}

// Default options.
const defaults: TraverseOptionsFull = {
  // TODO: Enable debug logging
  debug: false,
  rootEntity: 'sys/user',
  relations: {
    parental: [],
  },
}

Object.assign(Traverse, { defaults })

export default Traverse

if ('undefined' !== typeof module) {
  module.exports = Traverse
}
