
export default defineEventHandler(async (event) => {
    try {
        // if on production, return nothing
        if (process.env.NODE_ENV === 'production') {
            return {
                success: true,
                count: 0,
                fields: []
            }
        }
        const meta = await activecampaign.getDealCustomFieldMeta()
        return {
            success: true,
            count: meta.length,
            fields: meta.map(f => ({
                id: f.id,
                title: f.fieldLabel,
                type: f.fieldType,
                order: f.ordering
            }))
        }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            details: error.response?.data
        }
    }
})
