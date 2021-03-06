import React, { useContext, useCallback, useState, useEffect } from 'react';
import TransformContext from '../../context/TransformContext';
import styles from './Intersectable.module.css';
import { vec3 } from 'gl-matrix';
import { register, unRegister } from '../../collision/collision';
import uid from '../../util/uid';

const origin = vec3.fromValues(0, 0, 0);
const right = vec3.fromValues(1, 0, 0);
const down = vec3.fromValues(0, 1, 0);

const Intersectable: React.FC<{
    callback?: (type?: string) => void,
    id?: string
}> = ({ callback, id, ...props }) => {
    const [dimensions, setDimensions] = useState([0, 0]);
    const worldTransform = useContext(TransformContext);
    const [intersectableKey] = useState(id || uid('inter'));
    // initialize vectors as state so they can be reused
    const [[position, topSide, leftSide]] = useState([vec3.create(), vec3.create(), vec3.create()]);
  
    const measuredRef = useCallback(node => {
        if (node !== null) {
            setDimensions([node.offsetWidth, node.offsetHeight]);
        }
    }, [setDimensions]);

    useEffect(() => {
        // register intersectable
        vec3.transformMat4(position, origin, worldTransform);
        vec3.scale(topSide, right, dimensions[0]);
        vec3.transformMat4(topSide, topSide, worldTransform);
        vec3.sub(topSide, topSide, position);
        vec3.scale(leftSide, down, dimensions[1]);
        vec3.transformMat4(leftSide, leftSide, worldTransform);
        vec3.sub(leftSide, leftSide, position);

        register(intersectableKey, { position, leftSide, topSide, callback });
    }, [dimensions, worldTransform, intersectableKey, callback, position, topSide, leftSide]);

    // only unregister when component unmounts
    useEffect(() => () => unRegister(intersectableKey), [intersectableKey]);

    // maybe add a mutationObserver so dimensions changing because of a DOM change is picked up on?
    return (
        <div ref={measuredRef} className={styles.intersectable}>
            {props.children}
        </div>
    );
}

export default Intersectable;
