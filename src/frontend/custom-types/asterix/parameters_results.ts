export interface ProbIdentification {
    RWY24L: Counter;
    RWY24R: Counter;
    RWY02: Counter;
    Taxi: Counter;
    ApronT1: Counter;
    ApronT2: Counter;
    StandT1: Counter;
    StandT2: Counter;
    Airbone2: Counter;
    Airbone5: Counter;
    Airbone10: Counter;
}

interface Counter {
    Total: number;
    False: number;
}

export interface AccuracyResults {
    RWY24L_95max: number;
    RWY24L_99max: number;
    RWY24L_average: number;
    RWY24L_std: number;

    RWY24R_95max: number;
    RWY24R_99max: number;
    RWY24R_average: number;
    RWY24R_std: number;

    RWY2_95max: number;
    RWY2_99max: number;
    RWY2_average: number;
    RWY2_std: number;

    Taxi_95max: number;
    Taxi_99max: number;
    Taxi_average: number;
    Taxi_std: number;

    ApronT1_95max: number;
    ApronT1_99max: number;
    ApronT1_average: number;
    ApronT1_std: number;

    ApronT2_95max: number;
    ApronT2_99max: number;
    ApronT2_average: number;
    ApronT2_std: number;

    Airbone2_95max: number;
    Airbone2_average: number;
    Airbone2_std: number;

    Airbone5_95max: number;
    Airbone5_average: number;
    Airbone5_std: number;

    StandT1_max: number;
    StandT1_average: number;
    StandT1_std: number;

    StandT2_max: number;
    StandT2_average: number;
    StandT2_std: number;

    Maneouvering_95max: number;
    Maneouvering_99max: number;
    Maneouvering_average: number;
    Maneouvering_std: number;

    Apron_95max: number;
    Apron_99max: number;
    Apron_average: number;
    Apron_std: number;

    Stand_max: number;
    Stand_average: number;
    Stand_std: number;

}