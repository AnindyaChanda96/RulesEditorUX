import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { EditorRule } from 'src/app/models/rules-editor-row.model'
import { RulesEditorUtils } from 'src/app/utils/rules-editor.utils'
import { Field, LogicalOperator, Operator, OperatorSet, Rule, RulesEditorInput, Value } from '../../models/rules-editor-main.model'

@Component({
  selector: 'rules-editor',
  templateUrl: './rules-editor-main.component.html',
  styleUrls: ['./rules-editor-main.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RulesEditorMainComponent {
  @Input()
  public set rulesEditorInput(rulesEditorInput: RulesEditorInput) {
    this.resetEditorData()
    this.editorData = rulesEditorInput
    this.initEditorData()
  }
  
  @Input() editorIdentifier: string | undefined

  @Output() rulesEditorOutput: any = new EventEmitter()

  public editorData: RulesEditorInput | undefined

  public clauses: EditorRule[] = []
  public clauseGroupLevel: number = 1
  public groupIds: number[] = []
  public maxGroupLevel = 0
  public currentGroupId = 0
  public isGroupingDisabled = true
  public clauseGroupingCheckByIndexMapper: any = {}
  public groupsUiColWidth = 0
  public groupsUiDivWidth = 20


  resetEditorData() {
    this.clauses = []
    this.groupIds = []
    this.currentGroupId = 0
    this.clauseGroupLevel = 1
    this.clauseGroupingCheckByIndexMapper = {}
  }

  initEditorData() {
    if (
      this.editorData &&
      this.editorData.activeClauses &&
      this.editorData.activeClauses.length > 0
    ) {
      this.editorData.activeClauses.forEach((clause: Rule) => {
        this.clauseGroupLevel = 1
        this.setActiveClause(clause)
      })
    }
    this.setNewClauseTmplData()
    this.calcGroupIndicatorColumnWidth()
    this.setClauseIsGroupStartEndFlags()
    this.resetAllGroupChecks()
  }

  setActiveClause(clauseData: Rule) {
    if (!clauseData.groupedClause || clauseData.groupedClause.length === 0) {
      if (this.editorData) {
        const clauseDetails = new EditorRule() 
        clauseDetails.logicalOperators = this.editorData.logicalOperators
        clauseDetails.fields = this.editorData.fields
        clauseDetails.operators = this.editorData.operators
        clauseDetails.values = this.editorData.values
        clauseDetails.selectedLogicalOperator = clauseData.logicalOperator ? clauseData.logicalOperator.name : undefined
        clauseDetails.selectedField = clauseData.field ? clauseData.field.name : undefined
        clauseDetails.selectedOperator = clauseData.operator ? clauseData.operator.name : undefined
        clauseDetails.selectedValue = clauseData.value ? clauseData.value.name : undefined
        clauseDetails.groupLevel = this.clauseGroupLevel
        clauseDetails.groupMembership = JSON.parse(JSON.stringify(this.groupIds))
        this.clauses.push(clauseDetails)
      }
    } else if (
      clauseData.groupedClause &&
      clauseData.groupedClause.length > 0
    ) {
      this.clauseGroupLevel++
      this.currentGroupId++
      this.groupIds.push(this.currentGroupId)
      clauseData.groupedClause.forEach((clause: Rule) => {
        this.setActiveClause(clause)
      })
      this.clauseGroupLevel--
      this.groupIds.pop()
    }
  }

  setNewClauseTmplData(): EditorRule {
    const newClauseData = new EditorRule()
    if (this.editorData) {
      newClauseData.logicalOperators = this.editorData.logicalOperators
      newClauseData.fields = this.editorData.fields
      newClauseData.operators = this.editorData.operators
      newClauseData.values = this.editorData.values
    }

    return newClauseData
  }

  addNewClauseRow = (pivotClause: any) => {
    const newClauseData = this.setNewClauseTmplData()
    if (pivotClause.clauseIndex === -1) {
      newClauseData.groupLevel = 1
      newClauseData.groupMembership = []
      this.clauses = [...this.clauses, newClauseData]
    } else {
      newClauseData.groupLevel = this.clauses[pivotClause.clauseIndex].groupLevel
      newClauseData.groupMembership = JSON.parse(JSON.stringify(this.clauses[pivotClause.clauseIndex].groupMembership))
      this.clauses = [
        ...this.clauses.slice(0, pivotClause.clauseIndex),
        newClauseData,
        ...this.clauses.slice(pivotClause.clauseIndex),
      ]
    }
    this.calcGroupIndicatorColumnWidth()
    this.setClauseIsGroupStartEndFlags()
    this.resetAllGroupChecks()
    this.emitActiveClauses()
  }

  removeClauseRow = (pivotClause: any) => {
    let nodeSiblingsCount = 0
    let parentNodeHasNestedGrouping = false
    const parentNodeChildrenIndices = []
    if (this.clauses[pivotClause.clauseIndex].groupLevel === 1) {
      const allGroups = this.getGroupsByClauseIndices()
      const level1Groups = RulesEditorUtils.getLargestNonIntersectingSets(allGroups)
      let pivotClauseHasNonGroupedSiblings = false
      this.clauses.forEach((clause: EditorRule, clauseIndex: number) => {
        if (clause.groupLevel === 1 && pivotClause.clauseIndex !== clauseIndex) {
          pivotClauseHasNonGroupedSiblings = true
        }
      })
      if (!pivotClauseHasNonGroupedSiblings && level1Groups.length <= 1) {
        this.clauses.forEach((clause: EditorRule) => {
          clause.groupLevel--
        })
      }
    } else if (this.clauses[pivotClause.clauseIndex].groupLevel > 1) {
      for (
        let index = pivotClause.clauseIndex - 1;
        index >= 0 &&
        this.clauses[index].groupLevel >=
          this.clauses[pivotClause.clauseIndex].groupLevel &&
        RulesEditorUtils.isArraySubset(
          this.clauses[pivotClause.clauseIndex].groupMembership,
          this.clauses[index].groupMembership
        );
        index--
      ) {
        if (
          this.clauses[index].groupLevel ===
            this.clauses[pivotClause.clauseIndex].groupLevel &&
          JSON.stringify(this.clauses[index].groupMembership) ===
            JSON.stringify(this.clauses[pivotClause.clauseIndex].groupMembership)
        ) {
          nodeSiblingsCount++
        }
        if (
          this.clauses[index].groupLevel >
          this.clauses[pivotClause.clauseIndex].groupLevel
        ) {
          parentNodeHasNestedGrouping = true
        }
        parentNodeChildrenIndices.push(index)
      }

      for (
        let index = pivotClause.clauseIndex + 1;
        index < this.clauses.length &&
        this.clauses[index].groupLevel >=
          this.clauses[pivotClause.clauseIndex].groupLevel &&
        RulesEditorUtils.isArraySubset(
          this.clauses[pivotClause.clauseIndex].groupMembership,
          this.clauses[index].groupMembership
        );
        index++
      ) {
        if (
          this.clauses[index].groupLevel ===
            this.clauses[pivotClause.clauseIndex].groupLevel &&
          JSON.stringify(this.clauses[index].groupMembership) ===
            JSON.stringify(this.clauses[pivotClause.clauseIndex].groupMembership)
        ) {
          nodeSiblingsCount++
        }
        if (
          this.clauses[index].groupLevel >
          this.clauses[pivotClause.clauseIndex].groupLevel
        ) {
          parentNodeHasNestedGrouping = true
        }
        parentNodeChildrenIndices.push(index)
      }
      if (
        (!parentNodeHasNestedGrouping && nodeSiblingsCount === 1) ||
        (parentNodeHasNestedGrouping && nodeSiblingsCount === 0)
      ) {
        const groupIdToRemove = this.getNonEssentialGroupId(
          pivotClause.clauseIndex,
          parentNodeChildrenIndices
        )
        if (groupIdToRemove) {
          parentNodeChildrenIndices.forEach((index: number) => {
            this.clauses[index].groupMembership = this.clauses[
              index
            ].groupMembership.filter((item, _index) => item !== groupIdToRemove)
            this.clauses[index].groupLevel--
          })
        }
      }
    }
    this.clauses = this.clauses.filter(
      (item, _index) => pivotClause.clauseIndex !== _index
    )
    this.calcGroupIndicatorColumnWidth()
    this.setClauseIsGroupStartEndFlags()
    this.resetAllGroupChecks()
    this.emitActiveClauses()
  }

  getNonEssentialGroupId(
    nodeIndex: number,
    nodeParentDescendantIndices: any[]
  ): any {
    let nonEssentialGroupId
    let groupIdsToCheckForRemoval = JSON.parse(
      JSON.stringify(this.clauses[nodeIndex].groupMembership)
    )
    this.clauses[nodeIndex].groupMembership.forEach((groupId: number) => {
      this.clauses.forEach((clause: EditorRule, clauseIndex: number) => {
        if (
          nodeIndex !== clauseIndex &&
          clause.groupMembership.indexOf(groupId) >= 0 &&
          nodeParentDescendantIndices.indexOf(clauseIndex) < 0
        ) {
          groupIdsToCheckForRemoval = groupIdsToCheckForRemoval.filter(
            (item: any, _index: number) => item !== groupId
          )
        }
      })
      if (groupIdsToCheckForRemoval.indexOf(groupId) >= 0) {
        nodeParentDescendantIndices.forEach((childClauseIndex: number) => {
          if (
            this.clauses[childClauseIndex].groupMembership.indexOf(groupId) < 0
          ) {
            groupIdsToCheckForRemoval = groupIdsToCheckForRemoval.filter(
              (item: any, _index: number) => item !== groupId
            )
          }
        })
      }
    })
    if (groupIdsToCheckForRemoval.length > 0) {
      nonEssentialGroupId = groupIdsToCheckForRemoval[0]
    }

    return nonEssentialGroupId
  }

  emitActiveClauses() {
    let activeClauses: Rule[] = []
    this.clauses.forEach((clause: EditorRule, clauseIndex: number) => {
      let clauseDetails = this.getClauseDetails(clause)
      if (clause.groupMembership.length === 0) {
        activeClauses.push(clauseDetails)
      } else if (clauseIndex === 0) {
        for (let level = 1; level < clause.groupLevel; level++) {
          const newClause = new Rule()
          newClause.groupedClause = [clauseDetails]
          clauseDetails = newClause
        }
        activeClauses.push(clauseDetails)
      } else {
        const prevClauseIntersectingGroupCount = RulesEditorUtils.getArrayCommonElementsCount(
          clause.groupMembership,
          this.clauses[clauseIndex - 1].groupMembership
        )
        const prevClauseNonIntersectingGroupCount =
          clause.groupMembership.length - prevClauseIntersectingGroupCount

        for (
          let level = 1;
          level <= prevClauseIntersectingGroupCount;
          level++
        ) {
          activeClauses = activeClauses[activeClauses.length - 1].groupedClause
        }
        for (
          let level = 1;
          level <= prevClauseNonIntersectingGroupCount;
          level++
        ) {
          const newClause = new Rule()
          newClause.groupedClause = [clauseDetails]
          clauseDetails = newClause
        }
        activeClauses.push(clauseDetails)
      }
    })
    this.rulesEditorOutput.emit(activeClauses)
  }

  getClauseDetails(clause: EditorRule): Rule {
    const clauseDetails = new Rule()

    clauseDetails.logicalOperator = {
      name: clause.selectedLogicalOperator,
      value: clause.selectedLogicalOperator
    }
    if (clause.logicalOperators && clause.logicalOperators.length >= 0) {
      clause.logicalOperators.forEach((lo: LogicalOperator) => {
        if (clause.selectedLogicalOperator === lo.name) {
          clauseDetails.logicalOperator = lo
        }
      })
    }

    clauseDetails.field = {
      name: clause.selectedField,
      value: clause.selectedField,
      type: 'string'
    }
    if (clause.fields && clause.fields.length >= 0) {
      clause.fields.forEach((fd: Field) => {
        if (clause.selectedField === fd.name) {
          clauseDetails.field = fd
        }
      })
    }

    clauseDetails.operator = {
      name: clause.selectedOperator,
      value: clause.selectedOperator,
      isValueRequired: true
    }
    if (clause.operators && clause.operators.length >= 0) {
      clause.operators.forEach((opSet: OperatorSet) => {
        if (
          opSet.type &&
          clauseDetails.field &&
          clauseDetails.field.type &&
          opSet.type.toLowerCase() === clauseDetails.field.type.toLowerCase()
        ) {
          if (opSet.operators && opSet.operators.length >= 0) {
            opSet.operators.forEach((op: Operator) => {
              if (clause.selectedOperator === op.name) {
                clauseDetails.operator = op
              }
            })
          }
        }
      })
    }

    clauseDetails.value = {
      name: clause.selectedValue,
      value: clause.selectedValue,
      type: 'string'
    }
    if (clause.values && clause.values.length >= 0) {
      clause.values.forEach((val: Value) => {
        if (clause.selectedValue === val.name) {
          clauseDetails.value = val
        }
      })
    }

    return clauseDetails
  }

  onkeydown(event: any, eventName: string) {
    const enterKeyCode = 13
    const keycode = event.keyCode || event.which
    if (keycode === enterKeyCode && eventName === 'addClause') {
      this.addNewClauseRow({ clauseIndex: -1 })
    }
  }

  resetAllGroupChecks() {
    this.clauses = JSON.parse(JSON.stringify(this.clauses))
    this.clauseGroupingCheckByIndexMapper = {}
    this.isGroupingDisabled = true
  }

  clauseGroupCheckToggled(event: any) {
    this.clauseGroupingCheckByIndexMapper[event.clauseIndex] = event.isChecked
    this.validateIndicesForGrouping()
  }

  validateIndicesForGrouping() {
    let indicesValidForGrouping = true
    const groupIndices = this.getIndicesForGrouping()
    groupIndices.sort((firstGroupId: number, secondGroupId: number) => {
      return firstGroupId - secondGroupId
    })
    const minIndicesForGrouping = 2
    if (groupIndices.length < minIndicesForGrouping) {
      // #region: Cannot group if none or 1 selected index
      indicesValidForGrouping = false
    }
    // #region: Cannot group if selected indices are non consecutive
    for (let index = 1; index < groupIndices.length; index++) {
      if (Math.abs(groupIndices[index] - groupIndices[index - 1]) !== 1) {
        indicesValidForGrouping = false
      }
    }
    // #region: Cannot group if already grouped
    const activeGroups = this.getGroupsByClauseIndices()
    activeGroups.forEach((groupSet: any[]) => {
      if (JSON.stringify(groupIndices) === JSON.stringify(groupSet)) {
        indicesValidForGrouping = false
      }
    })
    // #region: Cannot group if intersecting with existing groups
    activeGroups.forEach((groupSet: any[]) => {
      if (RulesEditorUtils.isArrayIntersectionButNotSubset(groupIndices, groupSet)) {
        indicesValidForGrouping = false
      }
    })
    if (indicesValidForGrouping) {
      this.isGroupingDisabled = false
    } else {
      this.isGroupingDisabled = true
    }
  }

  getGroupsByClauseIndices(): any[] {
    // Group id vs grouped clause indices mapping.
    const groupIdVsGroupedClauseIndicesMap: any = {}
    this.clauses.forEach((clause: EditorRule, clauseIndex: number) => {
      if (clause.groupMembership.length > 0) {
        clause.groupMembership.forEach((groupId: number) => {
          if (!groupIdVsGroupedClauseIndicesMap[groupId]) {
            groupIdVsGroupedClauseIndicesMap[groupId] = []
          }
          groupIdVsGroupedClauseIndicesMap[groupId].push(clauseIndex)
        })
      }
    })
    // Sorting clause indices for inside group and pushing it in a list 
    const groupedClauseIndicesList: any[] = []
    if (Object.keys(groupIdVsGroupedClauseIndicesMap).length > 0) {
      Object.keys(groupIdVsGroupedClauseIndicesMap).forEach((groupId: any) => {
        if (groupIdVsGroupedClauseIndicesMap[groupId] && groupIdVsGroupedClauseIndicesMap[groupId].length > 0) {
          groupIdVsGroupedClauseIndicesMap[groupId].sort(
            (clauseIndexA: number, clauseIndexB: number) => {
              return clauseIndexA - clauseIndexB
            }
          )
          groupedClauseIndicesList.push(JSON.parse(JSON.stringify(groupIdVsGroupedClauseIndicesMap[groupId])))
        }
      })
    }
    // Sorting groups by size
    groupedClauseIndicesList.sort((firstGroup: any[], secondGroup: any[]) => {
      return firstGroup.length - secondGroup.length
    })

    return groupedClauseIndicesList
  }

  groupSelectedIndices() {
    this.currentGroupId++
    const groupIndices = this.getIndicesForGrouping()
    groupIndices.forEach((index: number) => {
      this.clauses[index].groupLevel++
      this.clauses[index].groupMembership.push(this.currentGroupId)
    })
    const groupIdVsGroupedClauseIndicesMap: any = {}
    this.clauses.forEach((clause: EditorRule, index: number) => {
      if (clause.groupMembership.length > 0) {
        clause.groupMembership.forEach((groupId: number) => {
          if (!groupIdVsGroupedClauseIndicesMap[groupId]) {
            groupIdVsGroupedClauseIndicesMap[groupId] = []
          }
          groupIdVsGroupedClauseIndicesMap[groupId].push(index)
        })
      }
    })
    this.clauses.forEach((clause: EditorRule) => {
      clause.groupMembership.sort(
        (firstGroupId: number, secondGroupId: number) => {
          return (
            groupIdVsGroupedClauseIndicesMap[secondGroupId].length - groupIdVsGroupedClauseIndicesMap[firstGroupId].length
          )
        }
      )
    })
    this.calcGroupIndicatorColumnWidth()
    this.setClauseIsGroupStartEndFlags()
    this.resetAllGroupChecks()
    this.emitActiveClauses()
  }

  unGroupClausesByGroupId(groupId: number) {
    this.clauses.forEach((clause: EditorRule) => {
      if (clause.groupMembership.indexOf(groupId) >= 0) {
        clause.groupLevel--
        clause.groupMembership = clause.groupMembership.filter(
          (item, _index) => item !== groupId
        )
      }
    })
    this.calcGroupIndicatorColumnWidth()
    this.setClauseIsGroupStartEndFlags()
    this.resetAllGroupChecks()
    this.emitActiveClauses()
  }

  getIndicesForGrouping(): any[] {
    const groupIndices: any = []
    Object.keys(this.clauseGroupingCheckByIndexMapper).forEach((index: any) => {
      if (this.clauseGroupingCheckByIndexMapper[index]) {
        const decimalRadix = 10
        groupIndices.push(parseInt(index, decimalRadix))
      }
    })

    return groupIndices
  }

  calcGroupIndicatorColumnWidth() {
    let colSize = 1
    this.clauses.forEach((clause: EditorRule) => {
      if (clause.groupLevel > colSize) {
        colSize = clause.groupLevel
      }
    })
    this.maxGroupLevel = colSize
    this.groupsUiColWidth = (colSize - 1) * this.groupsUiDivWidth
  }

  setClauseIsGroupStartEndFlags() {
    this.clauses.forEach((clause: EditorRule, index: number) => {
      clause.groupMembershipIsStart = []
      clause.groupMembershipIsEnd = []
      if (index === 0) {
        clause.groupMembershipIsStart = new Array(
          clause.groupMembership.length
        ).fill(true)
        clause.groupMembershipIsEnd = new Array(
          clause.groupMembership.length
        ).fill(false)
      } else if (index === this.clauses.length - 1) {
        clause.groupMembershipIsEnd = new Array(
          clause.groupMembership.length
        ).fill(false)
        clause.groupMembershipIsEnd = new Array(
          clause.groupMembership.length
        ).fill(true)
      } else {
        clause.groupMembership.forEach((groupId: number) => {
          const isGroupStart =
            this.clauses[index - 1].groupMembership.indexOf(groupId) === -1
              ? true
              : false
          const isGroupEnd =
            this.clauses[index + 1].groupMembership.indexOf(groupId) === -1
              ? true
              : false
          clause.groupMembershipIsStart.push(isGroupStart)
          clause.groupMembershipIsEnd.push(isGroupEnd)
        })
      }
    })
  }
}
