function getChatHisotryPipline(page, per_page, chat_model_id, startDate, endDate) {
    var masterpipeline = [
        {
            $match: {
                created_time: { $gte: startDate, $lte: endDate },
                chat_model_id: chat_model_id
            }
        },
        {
            $sort: { created_time: -1 }
        }
    ]
    
    var sessionlogspipline = [
        {
            $lookup: {
                from: "chatsessionlogs",
                let: { chatSessionId: "$chat_session_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$chat_session_id", "$$chatSessionId"] }
                        }
                    },
                    {
                        $sort: { created_time: -1 }
                    }
                ],
                as: "logs"
            }
        },
        {
            $lookup: {
                from: "leads",
                let: { chatSessionId: "$chat_session_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$chat_session_id", "$$chatSessionId"] }
                        }
                    }
                ],
                as: "leads"
            }
        }
    ];

    if (page != "full") { 
        masterpipeline.push(
            {
                $skip: (page - 1) * per_page
            },
            {
                $limit: per_page
            },
        );

        sessionlogspipline[0].$lookup.pipeline.push({
            $limit: 10
        });
    }

    masterpipeline.push(...sessionlogspipline)
    return masterpipeline
}


module.exports = { getChatHisotryPipline }