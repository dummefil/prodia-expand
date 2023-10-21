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
                           fields,
                           setFields
                       }) => {
    return (
        <div className="form-container">
            <form id="settings-form" onSubmit={handleSubmit}>
                <label htmlFor="positive" >Positive:</label>
                <textarea id="positive" value={fields.positive} onChange={setFields}></textarea>

                <label htmlFor="negative">Negative:</label>
                <textarea type="text" id="negative" value={fields.negative} onChange={setFields}/>

                <label htmlFor="cfgScale">CFG Scale:</label>
                <input type="text" id="cfgScale" value={fields.cfgScale} onChange={setFields}/>

                <label htmlFor="steps">Steps:</label>
                <input type="text" id="steps" value={fields.steps} onChange={setFields}/>

                <label htmlFor="seed">Seed:</label>
                <input type="text" id="seed" value={fields.seed} onChange={setFields}/>

                <label htmlFor="count">Instances:</label>
                <input type="number" id="count" value={fields.count} onChange={setFields}/>

                <label>
                    <input type="checkbox" id="loop" checked={fields.loop} onChange={setFields}/>
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
                {/*<pre style={{overflow: 'auto'}}>{JSON.stringify(debug, null, 4)}</pre>*/}
            </form>
        </div>
    );
};

export default FormComponent;
