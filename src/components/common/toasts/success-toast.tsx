const SuccessToast = ({
    data
}: {
    data: { title: string; description: string }
}) => {
    return (
        <div>
            <h4 className="font-black text-green-400">{data.title}</h4>
            <p>{data.description}</p>
        </div>
    )
}

export default SuccessToast
