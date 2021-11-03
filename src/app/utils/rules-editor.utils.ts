export class RulesEditorUtils {
    public static getItemFromArrayByName(
      arr: any[],
      itemName: any
    ): any {
      let selectedItem: any = {}
      selectedItem.name = itemName
      selectedItem.value = itemName
      selectedItem.type = 'string'
      if (arr && itemName && arr.length >= 0) {
        arr.forEach((item) => {
          if (itemName === item.name) {
            selectedItem = item
          }
        })
      }
  
      return selectedItem
    }
  
    public static isArraySubset(arr1: any[], arr2: any[]) {
      if (arr1 && arr1.length >= 0 && arr2 && arr2.length >= 0) {
        return arr1.every((value: number) => {
          return arr2.indexOf(value) >= 0
        })
      } else {
        return false
      }
    }
  
    public static isArrayIntersectionButNotSubset(arr1: any[], arr2: any[]) {
      let isArrayIntersectionButNotSubset = false
      if (arr1 && arr1.length >= 0 && arr2 && arr2.length >= 0) {
        let hasCommonElement = false
        let arr1HasExclusiveItem = false
        arr1.forEach((element: any) => {
          if (arr2.indexOf(element) < 0) {
            arr1HasExclusiveItem = true
          } else if (arr2.indexOf(element) >= 0) {
            hasCommonElement = true
          }
        })
        let arr2HasExclusiveItem = false
        arr2.forEach((element: any) => {
          if (arr1.indexOf(element) < 0) {
            arr2HasExclusiveItem = true
          }
        })
        if (hasCommonElement && arr1HasExclusiveItem && arr2HasExclusiveItem) {
          isArrayIntersectionButNotSubset = true
        }
      }
  
      return isArrayIntersectionButNotSubset
    }
  
    public static getArrayCommonElementsCount(arr1: any[], arr2: any[]) {
      let count = 0
      if (arr1 && arr1.length >= 0 && arr2 && arr2.length >= 0) {
        arr1.forEach((element: any) => {
          if (arr2.indexOf(element) >= 0) {
            count++
          }
        })
      }
  
      return count
    }
  
    public static getLargestNonIntersectingSets(arraySets: any): any {
      const resultSet = []
      if (arraySets.length > 0) {
        resultSet.push(JSON.parse(JSON.stringify(arraySets[0])))
        for (let setIndex = 1; setIndex < arraySets.length - 1; setIndex++) {
          let isSetSubset = false
          resultSet.forEach((outerGroup: any[]) => {
            if (RulesEditorUtils.isArraySubset(arraySets[setIndex], outerGroup)) {
              isSetSubset = true
            }
          })
          if (!isSetSubset) {
            resultSet.push(JSON.parse(JSON.stringify(arraySets[setIndex])))
          }
        }
      }
      resultSet.sort((firstGroup: any[], secondGroup: any[]) => {
        return firstGroup[0] - secondGroup[0]
      })
  
      return resultSet
    }
  }
  