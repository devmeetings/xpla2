import React from 'react';
import Props from 'react-immutable-proptypes';
import _ from 'lodash';

import TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';

import styles from './FileTree.scss';

import Tooltip from '../Tooltip';
import {Icon} from '../Icon/Icon';

export class FileTree extends React.Component {

  constructor (...args) {
    super(...args);
    const tree = this.buildTree(this.props.files);
    this.state = {
      tree: tree
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.files === this.props.files) {
      return true;
    }

    this.setState({
      tree: this.buildTree(newProps.files)
    });
  }

  buildTree (files) {
    // Convert the structure
    const tree = files
      .map((file) => {
        const name = file.get('name');
        const path = name.split('/');
        return {
          path,
          file
        };
      })
      .reduce((tree, file) => {
        const lastPathNode = file.path.reduce((current, pathPart) => {
          let pathNode = _.find(current.children, {
            name: pathPart
          });

          // check if node found
          if (!pathNode) {
            pathNode = {
              name: pathPart,
              children: []
            }
            current.children.push(pathNode);
          }
          // go deeper into that node
          return pathNode;
        }, {
          children: tree
        });

        // Update path for last node
        delete lastPathNode.children;
        lastPathNode.file = file.file;

        // Return the whole tree
        return tree;
      }, []);

    return tree;
  }

  onFileChange (node) {
    this.props.onChange(node.file);
  }

  renderTreeNodeLabel (node) {
    return (
      <span className={styles.node}>
        {node.name}
      </span>
    );
  }

  renderBadge (file) {
    if (!file.get('highlight').size) {
      return;
    }
    return (
      <span className={styles.badge}>
        <Icon icon={'dot'} size={'1em'} />
      </span>
    );
  }

  renderTreeLeaf (node) {
    const isActive = node.file.get('name') === this.props.active.get('name');
    return (
      <div key={node.name}>
        <a
          className={isActive ? `${styles.leaf} ${styles.active}` : styles.leaf}
          onClick={this.onFileChange.bind(this, node)}>
          {node.name}
          {this.renderBadge(node.file)}
        </a>
      </div>
    );
  }

  renderSubtree (tree) {
    return tree.map((elem) => {
      if (elem.children) {
        return (
          <TreeView
            defaultCollapsed={false}
            key={elem.name}
            nodeLabel={this.renderTreeNodeLabel(elem)}
            >
            {this.renderSubtree(elem.children)}
            </TreeView>
        );
      }
      return this.renderTreeLeaf(elem);
    });
  }

  render () {
    const tree = this.state.tree;
    return (
      <div className={styles.tree}>
        {this.renderSubtree(tree)}
      </div>
    );
  }
}

FileTree.propTypes = {
  files: Props.listOf(Props.contains({
    name: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired
  })),
  active: Props.contains({
    name: React.PropTypes.string.isRequired
  }).isRequired,
  onChange: React.PropTypes.func
};
