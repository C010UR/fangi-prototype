<?php

declare(strict_types=1);

namespace App\Doctrine\DQL;

use Doctrine\DBAL\Types\Type;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\AST\TypedExpression;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

class Search extends FunctionNode implements TypedExpression
{
    private Node $leftExpression;
    private Node $rightExpression;

    public function getSql(SqlWalker $sqlWalker): string
    {
        return \sprintf(
            'similarity(%s, %s)',
            $this->leftExpression->dispatch($sqlWalker),
            $this->rightExpression->dispatch($sqlWalker),
        );
    }

    public function parse(Parser $parser): void
    {
        $parser->match(TokenType::T_IDENTIFIER);
        $parser->match(TokenType::T_OPEN_PARENTHESIS);

        $this->leftExpression = $parser->StringPrimary();
        $parser->match(TokenType::T_COMMA);
        $this->rightExpression = $parser->StringPrimary();

        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    public function getReturnType(): Type
    {
        return Type::getType(Types::FLOAT);
    }
}
