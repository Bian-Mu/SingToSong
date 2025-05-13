interface SingleNoteProps {
    pitchunion: PitchUnion
}

const SingleNote: React.FC<SingleNoteProps> = ({ pitchunion }) => {
    return (
        <div>
            {pitchunion.note}
        </div>
    )
}

export default SingleNote