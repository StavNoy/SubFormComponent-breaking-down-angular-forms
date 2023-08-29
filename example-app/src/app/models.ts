// Main parent object
export interface ReportView {
    name: string;
    xSeries: XSeries[];
    ySeries: YSeries[];
    axes: Axis[];
}

// Represents groups
export interface XSeries {
    columnId: string;
    label: string;
}

// Represents aggregated values
export interface YSeries {
    columnId: string;
    label: string;
    axisId: Axis["id"]; // == string
    operation: SimpleOperation | WeightedOperation;
}

export interface Axis {
    id: string;
    label: string;
}

export interface SimpleOperation {
    operator: SimpleOperator;
}

export interface WeightedOperation {
    operator: WeightedOperator;
    weightedColumnId: string;
}

export enum SimpleOperator {
    "AVG" = "AVG",
    "SUM" = "SUM",
    "MAX" = "MAX",
    // COUNT, etc.
}

export enum WeightedOperator {
    "WEIGHTED_AVG" = "WEIGHTED_AVG",
    "WEIGHTED_SUM" = "WEIGHTED_SUM",
}

export type Operator = SimpleOperator | WeightedOperator;
