import instruments from "../../assets/instrument.json"
import "./InstrumentViewer.css"

const InstrumentViewer: React.FC = () => {
    return (
        <div id="instruments-viewer">
            {instruments.map((instrument) => (
                <span className="instrument-ul" key={instrument.index}>
                    {instrument.index}: {instrument.value}
                </span>
            ))}
        </div>
    )
}

export default InstrumentViewer;