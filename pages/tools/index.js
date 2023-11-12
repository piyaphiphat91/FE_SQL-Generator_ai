// import * as React from 'react';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';

// export default function comRadioGroup(props) {
//     return (
//         <FormControl>
//             <FormLabel
//                 id="demo-radio-buttons-group-label"
//                 style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}
//             >
//                 {props.titleName}
//             </FormLabel>
//             <br />
//             <RadioGroup
//                 aria-labelledby="demo-radio-buttons-group-label"
//                 // defaultValue="female"
//                 name="radio-buttons-group"
//                 onChange={props.handleChange}
//                 value={props.value}
//             >
//                 {props.dataList.length > 0 && (
//                     <>
//                         {props.dataList.map((item, i) => {
//                             return (
//                                 <>
//                                     <FormControlLabel
//                                         value={i}
//                                         control={<Radio />}
//                                         label={item.Database}
//                                     />
//                                 </>
//                             );
//                         })}
//                     </>
//                 )}
//             </RadioGroup>
//         </FormControl>
//     );
// }
import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function comRadioGroup(props) {
    return (
        <FormControl>
            <FormLabel
                id="demo-radio-buttons-group-label"
                style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}
            >
                {props.titleName}
            </FormLabel>
            <br />
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                onChange={e => props.handleChange(e.target.value)}
                value={props.selectedValue}
            >
                {props.dataList.length > 0 && (
                    <>
                        {props.dataList.map((item, i) => (
                            <FormControlLabel
                                key={i}
                                value={item.Database}
                                control={<Radio />}
                                label={item.Database}
                                // labelPlacement="start"
                            />
                        ))}
                    </>
                )}
            </RadioGroup>
        </FormControl>
    );
}
