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

class JsonArrayContains extends FunctionNode implements TypedExpression
{
    public ?Node $arrayExpression = null;
    /** @var Node[] */
    public array $valueExpressions = [];

    public function parse(Parser $parser): void
    {
        $parser->match(TokenType::T_IDENTIFIER); // ARRAY_CONTAINS
        $parser->match(TokenType::T_OPEN_PARENTHESIS);

        $this->arrayExpression = $parser->ArithmeticPrimary();

        $parser->match(TokenType::T_COMMA);

        $this->valueExpressions[] = $parser->ArithmeticPrimary();

        while ($parser->getLexer()->isNextToken(TokenType::T_COMMA)) {
            $parser->match(TokenType::T_COMMA);
            $this->valueExpressions[] = $parser->ArithmeticPrimary();
        }

        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    public function getSql(SqlWalker $sqlWalker): string
    {
        $arrayValues = [];
        foreach ($this->valueExpressions as $valueExpression) {
            $arrayValues[] = $valueExpression->dispatch($sqlWalker);
        }

        return \sprintf(
            '(%s ??| array[%s])',
            $this->arrayExpression->dispatch($sqlWalker),
            implode(', ', $arrayValues),
        );
    }

    public function getReturnType(): Type
    {
        return Type::getType(Types::BOOLEAN);
    }
}
