import { createClient } from '@clickhouse/client'

const ClickHouseClient = createClient({
    host: process.env.CLICKHOUSE_HOST,
    database: "default",
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
    request_timeout: 120_000,

    clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 0,
        max_execution_time: 120
    }
})

export default ClickHouseClient;