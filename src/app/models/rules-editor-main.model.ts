export class RulesEditorInput {
    logicalOperators: LogicalOperator[] = []
    fields: Field[] = []
    operators: OperatorSet[] = []
    values: Value[] = []
    activeClauses: Rule[] = []
  }
  
export class Rule {
  groupedClause: Rule[] = []
  logicalOperator: LogicalOperator | undefined
  field: Field | undefined
  operator: Operator | undefined
  value: Value | undefined
}

export class LogicalOperator {
  name: string | undefined
  value: string | undefined
}

export class Field {
  name: string | undefined
  value: string | undefined
  type: string | undefined
  tooltip?: string
}

export class OperatorSet {
  type: string | undefined
  operators: Operator[] = []
}

export class Operator {
  name: string | undefined
  value: string | undefined
  isValueRequired: boolean = false
}

export class Value {
  name: string | undefined
  value: string | undefined
  type: string | undefined
  tooltip?: string
}

  