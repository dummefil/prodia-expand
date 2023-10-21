import React from 'react';
import RepeatIcon from './icons/RepeatIcon';
import ClearIcon from './icons/ClearIcon';

const FormComponent = ({
                           handleSubmit,
                           isLoading,
                           repeatLastFields,
                           resetFields,
                           timer,
                           error,
                           debug,
                           fields,
                           handleFieldChange
                       }) => {
    return (
        <div className="form-container">
            <form id="settings-form" onSubmit={handleSubmit}>
                <label htmlFor="positive" >Positive:</label>
                <textarea id="positive" value={fields.positive} onChange={handleFieldChange}></textarea>

                <label htmlFor="negative">Negative:</label>
                <input type="text" id="negative" value={fields.negative} onChange={handleFieldChange}/>

                <label htmlFor="cfgScale">CFG Scale:</label>
                <input type="text" id="cfgScale" value={fields.cfgScale} onChange={handleFieldChange}/>

                <label htmlFor="steps">Steps:</label>
                <input type="text" id="steps" value={fields.steps} onChange={handleFieldChange}/>

                <label htmlFor="seed">Seed:</label>
                <input type="text" id="seed" value={fields.seed} onChange={handleFieldChange}/>

                <label htmlFor="count">Instances:</label>
                <input type="number" id="count" value={fields.count} onChange={handleFieldChange}/>

                <label>
                    <input type="checkbox" id="loop" checked={fields.loop} onChange={handleFieldChange}/>
                    Enable Loop
                </label>

                <div style={{display: 'flex', gap: '12px'}}>
                    <button type="submit" id="generate-button" disabled={isLoading} style={{flex: '1 0 50%'}}>
                        {isLoading ? 'Generating...' : 'Fetch Images'}
                    </button>
                    <button onClick={repeatLastFields}>
                        <RepeatIcon/>
                    </button>
                    <button onClick={resetFields}>
                        <ClearIcon/>
                    </button>
                </div>

                <span id="timer">{timer > 0 && `Last: ${timer}|${timer / fields.count}`}</span>
                {error && <div id="error-container"><p className="error-message">{error}</p></div>}
                <br/>
                <br/>
                <pre style={{overflow: 'auto'}}>{JSON.stringify(debug, null, 4)}</pre>
            </form>

        </div>
    );
};

export default FormComponent;
